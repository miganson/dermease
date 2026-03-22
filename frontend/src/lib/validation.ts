export const fullNameRegex = /^[A-Za-z][A-Za-z .-]*$/;
export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const fullNameMessage =
  "Full name may only contain letters, spaces, periods, and hyphens.";
export const strongPasswordMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

