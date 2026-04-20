import db from '../../models/index.cjs';
const { Persona, Tarea, Tag } = db;

export const registro = async (req, res) => {
  try {
    const nueva = await Persona.create({ ...req.body, activo: true });
    res.status(201).json({ success: true, data: nueva });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const modificar = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findByPk(id);
    if (!persona) return res.status(404).json({ success: false, message: 'No encontrado' });
    await persona.update(req.body);
    res.json({ success: true, data: persona });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body; // true para activar, false para desactivar
    const persona = await Persona.findByPk(id);
    await persona.update({ activo });
    res.json({ success: true, message: `Usuario ${activo ? 'activado' : 'desactivado'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Todos los Tags relacionados con una Persona
export const obtenerTagsDePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findByPk(id, {
      include: {
        model: Tarea, as: 'tareas',
        include: { model: Tag, as: 'etiquetas', through: { attributes: [] } }
      }
    });
    // Aplanamos el resultado para dar solo los tags
    const tags = [...new Set(persona.tareas.flatMap(t => t.etiquetas))];
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};