export async function loadJSON(path) {
  try {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error(`加载 ${path} 失败:`, error)
    return null
  }
}