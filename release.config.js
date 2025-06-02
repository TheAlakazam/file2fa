// release.config.js
export default {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/github',
        '@semantic-release/git',
        [
            '@semantic-release/npm',
            {
                npmPublish: false, // Set to false if you don't want to publish to npm
            },
        ],
    ],
    preset: 'conventionalcommits',
    changelogFile: 'CHANGELOG.md',
    git: {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
};
