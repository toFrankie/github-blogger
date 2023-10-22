export const cdnURL = ({user, repo, file}) => `https://cdn.jsdelivr.net/gh/${user}/${repo}/${file}`

export async function to(promise, errorExt) {
  try {
    const data = await promise
    const res = [null, data]
    return res
  } catch (err) {
    if (errorExt) {
      Object.assign(err, errorExt)
    }
    const res = [err, undefined]
    return res
  }
}
