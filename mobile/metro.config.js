const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro can find files across workspaces
config.watchFolders = [workspaceRoot];

// Prefer mobile's own node_modules over root's hoisted packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force react and all react/* sub-paths (react/jsx-runtime, react/jsx-dev-runtime,
// etc.) to resolve from mobile/node_modules/react@19.1.0.
// extraNodeModules is only a fallback and doesn't override normal resolution, so
// resolveRequest is required here to prevent root/node_modules/react@19.2.5 from
// being loaded and causing the react-native-renderer version mismatch.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    try {
      const filePath = require.resolve(moduleName, { paths: [projectRoot] });
      return { filePath, type: 'sourceFile' };
    } catch {
      // fall through to default resolution
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
