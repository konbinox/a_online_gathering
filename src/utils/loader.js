export async function loadJSON(path) {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`加载 ${path} 失败:`, error)
    return null
  }
}