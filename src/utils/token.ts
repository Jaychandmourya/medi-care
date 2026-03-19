export const generateToken = (): string => {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString()
}