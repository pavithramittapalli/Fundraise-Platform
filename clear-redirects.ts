// Clear any potential redirect loops
console.log('🧹 Clearing potential redirect loops...')

if (typeof window !== 'undefined') {
  // Clear redirect count
  sessionStorage.removeItem('redirectCount')
  
  // Clear any potentially corrupted auth data
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token && user) {
    try {
      // Validate user data
      JSON.parse(user)
      console.log('✅ Auth data is valid')
    } catch (error) {
      console.log('❌ Corrupted auth data found, clearing...')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
  
  console.log('✅ Redirect loops cleared')
} else {
  console.log('ℹ️ Run this script in the browser console')
}

// Instructions for manual clearing
console.log('\n📋 If you still see redirect loops:')
console.log('1. Open browser console (F12)')
console.log('2. Run: sessionStorage.clear()')
console.log('3. Run: localStorage.clear()')
console.log('4. Refresh the page')
console.log('5. Try logging in again')