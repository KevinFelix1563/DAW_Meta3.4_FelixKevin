import { test, expect } from '@playwright/test';

const EMAIL_ADMIN = 'kevin.felix59@uabc.edu.mx';
const PASSWORD_ADMIN = 'secreto123';

test.describe('Panel de Administración', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    trace: 'on-first-retry',
    await page.getByLabel('Correo electrónico').fill(EMAIL_ADMIN);
    await page.getByLabel('Contraseña').fill(PASSWORD_ADMIN);
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Navegamos al panel de admin
    await page.getByText('Panel Admin').click();
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('Debe listar usuarios y crear uno nuevo', async ({ page }) => {
    // Verificamos que estamos en la pestaña correcta
    await expect(page.getByText('Usuarios Registrados')).toBeVisible();

    // Abrimos el diálogo
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
    
    // Llenamos el formulario
    const emailPrueba = `test_${Date.now()}@uabc.edu.mx`;
    await page.getByLabel('Nombre').fill('Robot de Prueba');
    await page.getByLabel('Email').fill(emailPrueba);
    await page.getByLabel('Contraseña').fill('123456');
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Verificamos que el nuevo usuario aparezca en la tabla
    await expect(page.getByText(emailPrueba)).toBeVisible();
  });

  test('Debe ejecutar búsquedas avanzadas (Admin)', async ({ page }) => {
    await page.getByText('Búsquedas Avanzadas').click();
    await expect(page.getByText('Parámetros')).toBeVisible();

    await page.getByRole('combobox', { name: 'Selecciona Etiquetas' }).click({ force: true });
    
    await page.getByText('Backend', { exact: true }).click();
    await page.keyboard.press('Escape');

    // Ejecutamos la búsqueda
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByText('Resultados')).toBeVisible();
  });

  test('Debe eliminar un usuario confirmando el diálogo', async ({ page }) => {
    // Playwright descarta los alert() y confirm() por defecto.
    // Le instruimos que le dé "Aceptar" al diálogo de confirmación que programamos.
    page.once('dialog', dialog => dialog.accept());

    // Aseguramos que la tabla de usuarios haya cargado
    await expect(page.getByText('Usuarios Registrados')).toBeVisible();

    // Encontramos el último botón de eliminar y lo clickeamos
    const botonesEliminar = page.locator('.mdi-delete');
    await botonesEliminar.last().click();

    // Validamos que seguimos en el panel sin errores catastróficos
    await expect(page.getByText('Usuarios Registrados')).toBeVisible();
    await page.screenshot({ path: './evidencias/04-panel-admin.png' });
  });

});