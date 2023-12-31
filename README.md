# Github Blogger

> Inspired by [Aaronphy/Blogger](https://github.com/Aaronphy/Blogger).

This is a extension for VS Code that allows you to quickly create and manage Github Issues as blog posts. It uses the [Github REST API](https://docs.github.com/en/rest?apiVersion=2022-11-28) and [Github GraphQL API](https://docs.github.com/en/graphql) to manage your Issues, and all content created or updated through this extension can be found in your Github repository.

## Quick Start

1. Download and install extension from [Marketpalce](https://marketplace.visualstudio.com/items?itemName=Frankie.github-blogger).
2. Prepare your [Github Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
3. Open command palette by pressing `Command + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux), and type `Config Github Blogger` to complete the initial configuration. Alternatively, you can add the following configuration directly to the `settings.json`.

```json
{
  "github-blogger.token": "xxx", // Your GitHub Personal Access Token
  "github-blogger.user": "xxx", // Your GitHub Username
  "github-blogger.repo": "xxx", // Your GitHub Repository Name
  "github-blogger.branch": "main" // Your GitHub Repository Branch Name
}
```

> The written issues and the images uploaded during the process are stored in the `archives` and `images` directories. The `github-blogger.branch` is used to specify the branch, typically set to the default branch. Please make sure the branch already exists in the repository, otherwise issues archiving and image uploading may fail.

4. Open the command palette again and type `Open Github Blogger` to start writing your blog.

## Important Notes

- Please ensure that your Blogger repository is public. The reason is that the image uses jsDelivr + Github for CDN acceleration, which does not support private repository. [jsdelivr #18243](https://github.com/jsdelivr/jsdelivr/issues/18243#issuecomment-857512289)

## About

The extension mainly consists of the following libraries:

- [ant-design](https://github.com/ant-design/ant-design) - Building the user interface
- [bytemd](https://github.com/bytedance/bytemd) - Parsing markdown
- [octokit.js](https://github.com/octokit/octokit.js) - Interacting with the Github API

![](./images/screenshot-1.png)
![](./images/screenshot-2.png)
![](./images/screenshot-3.png)
