export async function parseErrorResponse(res: Response) {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data.error || data.message || res.statusText;
    } else {
      const text = await res.text();
      return text || res.statusText;
    }
  } catch {
    return res.statusText || 'Unknown error';
  }
}
