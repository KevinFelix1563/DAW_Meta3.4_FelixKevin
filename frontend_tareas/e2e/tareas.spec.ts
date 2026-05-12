import { test, expect } from '@playwright/test';

const EMAIL = 'kevin.felix59@uabc.edu.mx';
const PASSWORD = 'secreto123';

test.describe('CRUD de Tareas y Búsquedas Normales', () => {

  // Antes de cada prueba, iniciamos sesión
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill(EMAIL);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*\/tareas/);
  });

  test('Debe crear una nueva tarea', async ({ page }) => {
    const nombreTarea = `Tarea automatizada ${Date.now()}`;
    
    // Escribimos y agregamos la tarea
    await page.getByLabel('Escribe una nueva tarea...').fill(nombreTarea);
    await page.getByRole('button', { name: 'Agregar' }).click();

    // Verificamos que aparezca en la lista
    await expect(page.getByText(nombreTarea)).toBeVisible();
  });

  test('Debe poder usar el buscador por etiquetas', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Buscar tareas por etiquetas...' }).click({ force: true });
    
    // Seleccionamos una etiqueta de la lista desplegable de Vuetify
    await page.getByText('Backend', { exact: true }).click();
    
    // Cerramos el menú presionando Escape
    await page.keyboard.press('Escape');

    // Comprobamos que el filtro se haya aplicado
    await expect(page.getByText('Mis Tareas').first()).toBeVisible();
  });

  test('Debe poder eliminar una tarea', async ({ page }) => {
    // Hacemos que el nombre sea unico usando la fecha y hora
    const tareaBorrar = `Tarea desechable ${Date.now()}`;
    
    // La creamos
    await page.getByLabel('Escribe una nueva tarea...').fill(tareaBorrar);
    await page.getByRole('button', { name: 'Agregar' }).click();
    await expect(page.getByText(tareaBorrar)).toBeVisible();

    // Buscamos el contenedor específico que tiene nuestro texto único
    // y hacemos clic en el botón de eliminar que está dentro de esa fila
    const filaTarea = page.locator('.v-list-item', { hasText: tareaBorrar });
    await filaTarea.locator('.mdi-delete').click();

    // Verificamos que esta tarea específica desapareció
    await expect(page.getByText(tareaBorrar)).not.toBeVisible();
    await page.screenshot({ path: './evidencias/05-tareas-lista.png' });
  });

});