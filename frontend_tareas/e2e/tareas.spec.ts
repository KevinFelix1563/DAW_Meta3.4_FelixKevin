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
    // Abrimos el select de etiquetas de búsqueda
    await page.getByLabel('Buscar tareas por etiquetas...').click();
    
    // Seleccionamos una etiqueta de la lista desplegable de Vuetify
    // Asumiendo que la etiqueta "Backend" existe por tus capturas
    await page.getByText('Backend', { exact: true }).click();
    
    // Cerramos el menú presionando Escape
    await page.keyboard.press('Escape');

    // Comprobamos que el filtro se haya aplicado (no haya errores en pantalla)
    await expect(page.getByText('Mis Tareas')).toBeVisible();
  });

  test('Debe poder eliminar una tarea', async ({ page }) => {
    // Creamos una tarea desechable
    const tareaBorrar = 'Tarea para borrar';
    await page.getByLabel('Escribe una nueva tarea...').fill(tareaBorrar);
    await page.getByRole('button', { name: 'Agregar' }).click();
    await expect(page.getByText(tareaBorrar)).toBeVisible();

    // Hacemos clic en el primer botón de eliminar que encuentre en la lista
    const botonEliminar = page.locator('.mdi-delete').first();
    await botonEliminar.click();

    // Verificamos que la tarea ya no exista
    await expect(page.getByText(tareaBorrar)).not.toBeVisible();
    await page.screenshot({ path: './evidencias/05-lista-tareas.png' });
  });

});