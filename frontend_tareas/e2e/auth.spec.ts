import { test, expect } from '@playwright/test';

const PASSWORD_VALIDA = 'secreto123'; 
const EMAIL_ADMIN = 'kevin.felix59@uabc.edu.mx';

test.describe('Flujo de Autenticación y Seguridad', () => {

  test('Debe bloquear el acceso a rutas protegidas sin sesión', async ({ page }) => {
    // Intentamos ir a /tareas sin estar logueados
    await page.goto('/tareas');
    
    // Vue Router debe interceptarlo y regresarnos al login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Intentamos ir al panel de admin
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    // Llenamos el formulario con datos incorrectos
    await page.getByLabel('Correo electrónico').fill('correo@falso.com');
    await page.getByLabel('Contraseña').fill('contraseñaincorrecta');
    
    // Hacemos clic en el botón de Entrar
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Verificamos que aparezca el mensaje de error de Vuetify
    const alertaError = page.locator('.v-alert');
    await expect(alertaError).toBeVisible();
    await expect(alertaError).toContainText('Credenciales inválidas');
  });

  test('Debe iniciar sesión correctamente y redirigir a Tareas', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Correo electrónico').fill(EMAIL_ADMIN);
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
    
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Verificamos que la redirección haya sido exitosa
    await expect(page).toHaveURL(/.*\/tareas/);

    // Verificamos que la barra de navegación muestre el email del usuario
    await expect(page.getByText(EMAIL_ADMIN)).toBeVisible();
    
    // Como es administrador, debería ver el botón del Panel Admin
    await expect(page.getByText('Panel Admin')).toBeVisible();
  });

  test('Debe poder cerrar sesión', async ({ page }) => {
    // 1. Iniciar sesión primero
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill(EMAIL_ADMIN);
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*\/tareas/);

    // 2. Hacer clic en Salir
    await page.getByRole('button', { name: 'Salir' }).click();

    // 3. Verificar que nos sacó al login
    await expect(page).toHaveURL(/.*\/login/);
    
    // 4. Verificar que si intentamos volver con el botón de "Atrás" del navegador, no nos deje
    await page.goto('/tareas');
    await expect(page).toHaveURL(/.*\/login/);
  });

});