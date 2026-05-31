import { v4 as uuidv4 } from 'uuid'

const KEY = 'gsd_users'

const INITIAL_USERS = [
  {
    id: 'u-client',
    username: 'client',
    password: 'client123',
    role: 'client',
    createdAt: new Date().toISOString(),
  },
]

export const loadUsers = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    saveUsers(INITIAL_USERS)
    return INITIAL_USERS
  } catch {
    return INITIAL_USERS
  }
}

export const saveUsers = (users) => {
  localStorage.setItem(KEY, JSON.stringify(users))
}

export const findUser = (username, password) => {
  return loadUsers().find(
    (u) => u.username === username && u.password === password
  ) || null
}

export const addWorkManager = (username, password) => {
  const users = loadUsers()
  if (users.find((u) => u.username === username)) return { error: 'Username already exists' }
  const newUser = {
    id: uuidv4(),
    username,
    password,
    role: 'work_manager',
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, newUser])
  return { user: newUser }
}

export const deleteWorkManager = (id) => {
  const users = loadUsers().filter((u) => u.id !== id && u.role !== 'client' || u.role === 'client')
  saveUsers(users.filter((u) => u.id !== id))
}

export const getWorkManagers = () => {
  return loadUsers().filter((u) => u.role === 'work_manager')
}
