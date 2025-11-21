export const getGoogleRedirectUrl = (
  isCompleted: boolean,
  role: string,
  token: string,
): string => {
  const base = process.env.FRONTEND_BASE_URL;

  if (isCompleted) {
    // Usuario con registro completo → dashboard correspondiente
    switch (role) {
      case 'user':
        return `${base}/user/dashboard?token=${token}`;
      case 'provider':
        return `${base}/provider/dashboard?token=${token}`;
      case 'admin':
        return `${base}/admin/dashboard?token=${token}`;
      default:
        return `${base}/login`;
    }
  } else {
    // Usuario o proveedor incompleto → flujo de completar registro
    return role === 'provider'
      ? `${base}/complete-register-provider/?role=${role}&token=${token}`
      : `${base}/complete-register-user/?role=${role}&token=${token}`;
  }
};
