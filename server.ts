import express from 'express';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // API to get current git status (checks for uncommitted or unpushed changes)
  app.get('/api/git/status', async (_req, res) => {
    try {
      const { stdout: statusOut } = await execAsync('git status --porcelain');
      const changedFiles = statusOut.trim().split('\n').filter(Boolean);

      let unpushedCommits: string[] = [];
      try {
        const { stdout: logOut } = await execAsync('git log origin/main..HEAD --oneline');
        unpushedCommits = logOut.trim().split('\n').filter(Boolean);
      } catch {
        // remote might not be up or branches identical
      }

      const hasChanges = changedFiles.length > 0 || unpushedCommits.length > 0;

      res.json({
        hasChanges,
        changedFiles,
        unpushedCommits,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API to push to GitHub (which triggers Netlify)
  app.post('/api/git/push', async (req, res) => {
    try {
      const commitMsg = req.body?.message || 'feat: mise à jour validée depuis preview';
      // Add all changes
      await execAsync('git add -A');
      // Only commit if there are staged changes
      try {
        await execAsync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
      } catch {
        // No changes to commit, might already have a commit to push
      }
      // Push to GitHub
      const { stdout: pushOut } = await execAsync('git push origin main');
      res.json({ success: true, message: 'Déploiement poussé sur GitHub et Netlify !', details: pushOut });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API to discard uncommitted changes
  app.post('/api/git/discard', async (_req, res) => {
    try {
      await execAsync('git restore .');
      await execAsync('git clean -fd');
      res.json({ success: true, message: 'Modifications annulées avec succès.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
