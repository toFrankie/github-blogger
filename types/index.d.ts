type SettingKey = 'token' | 'user' | 'repo' | 'branch'

type Settings = {
  [K in SettingKey]: string
}
