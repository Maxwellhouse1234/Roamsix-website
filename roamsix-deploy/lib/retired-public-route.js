export function retiredPublicRoute(res) {
  return res.status(410).json({
    success: false,
    error: 'This form is no longer available. Please use the current ROAMSIX website or email info@roamsix.com.',
  });
}
