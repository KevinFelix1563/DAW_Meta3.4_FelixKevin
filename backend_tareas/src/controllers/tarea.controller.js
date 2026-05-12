import db from '../../models/index.cjs';
import { Op } from 'sequelize'; // Para búsquedas avanzadas

const { Tarea, Persona, Tag } = db;

export const obtenerTodas = async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      where: { personaId: req.usuario.id }, //Solo tareas de usuario
      include: [
        { model: Tag, as: 'etiquetas', attributes: ['id', 'nombre'], through: { attributes: [] } }
      ]
    });
    res.json({ success: true, data: tareas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener tareas', error: error.message });
  }
};

export const crear = async (req, res) => {
  try {
    const { titulo, descripcion, completada } = req.body;
    
    if (!titulo) return res.status(400).json({ success: false, message: 'El título es obligatorio' });

    // Asignamos la tarea automáticamente a quien hizo la petición
    const nuevaTarea = await Tarea.create({ 
      titulo, 
      descripcion, 
      completada, 
      personaId: req.usuario.id 
    });
    res.status(201).json({ success: true, data: nuevaTarea });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la tarea', error: error.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    // Aseguramos que la tarea exista Y sea del usuario actual
    const tarea = await Tarea.findOne({ where: { id, personaId: req.usuario.id } });
    
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada o acceso denegado' });

    await tarea.update(req.body);
    res.json({ success: true, message: 'Tarea actualizada', data: tarea });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar', error: error.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    // Solo borra si el ID coincide Y le pertenece al usuario
    const eliminados = await Tarea.destroy({ where: { id, personaId: req.usuario.id } });

    if (eliminados === 0) return res.status(404).json({ success: false, message: 'Tarea no encontrada o acceso denegado' });

    res.json({ success: true, message: 'Tarea eliminada permanentemente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar', error: error.message });
  }
};

export const agregarTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    // Solo puede etiquetar sus propias tareas
    const tarea = await Tarea.findOne({ where: { id, personaId: req.usuario.id } });
    const tag = await Tag.findByPk(tagId);

    if (!tarea || !tag) return res.status(404).json({ success: false, message: 'Tarea o Tag no encontrado' });

    await tarea.addEtiqueta(tag); 
    res.json({ success: true, message: 'Tag asociado a la tarea con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al asociar', error: error.message });
  }
};

// Buscar por una o varias etiquetas
export const buscarMisTareasPorEtiquetas = async (req, res) => {
  try {
    const { tagsIds } = req.body; // Array de IDs de tags [1, 2]

    const tareas = await Tarea.findAll({
      where: { personaId: req.usuario.id },
      include: [{
        model: Tag,
        as: 'etiquetas',
        where: { id: { [Op.in]: tagsIds } },
        required: true // Inner join: Fuerza a traer solo tareas que tengan estos tags
      }]
    });
    
    res.json({ success: true, data: tareas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en la búsqueda', error: error.message });
  }
};