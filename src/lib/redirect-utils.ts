// Prevent redirect loops in preview environments
export const preventRedirectLoop = (url: string): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check if we're in a preview environment
  const isPreview = window.location.hostname.includes('space.z.ai') || 
                   window.location.hostname.includes('preview-chat')
  
  if (isPreview) {
    // Prevent excessive redirects in preview
    const redirectCount = parseInt(sessionStorage.getItem('redirectCount') || '0')
    if (redirectCount > 5) {
      console.warn('Too many redirects detected, stopping redirect loop')
      sessionStorage.removeItem('redirectCount')
      return false
    }
    sessionStorage.setItem('redirectCount', (redirectCount + 1).toString())
    
    // Clear redirect count after 5 seconds
    setTimeout(() => {
      sessionStorage.removeItem('redirectCount')
    }, 5000)
  }
  
  return true
}

export const clearRedirectCount = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('redirectCount')
  }
}