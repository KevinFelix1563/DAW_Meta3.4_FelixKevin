import db from '../../models/index.cjs';
import { Op } from 'sequelize';

const { Persona, Tarea, Tag } = db;

export const buscarTareasPorEtiquetas = async (req, res) => {
  try {
    const { tagsIds } = req.body;
    // Forzamos a que sean un arreglo de números enteros
    const idsSeguros = tagsIds.map(id => typeof id === 'object' ? Number(id.id) : Number(id));

    const tareas = await Tarea.findAll({
      include: [
        { model: Tag, as: 'etiquetas', where: { id: { [Op.in]: idsSeguros } } },
        { model: Persona, as: 'autor', attributes: ['nombre', 'email'] }
      ]
    });
    res.json({ success: true, data: tareas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en búsqueda avanzada' });
  }
};

export const buscarUsuariosPorEtiquetas = async (req, res) => {
  try {
    const { tagsIds } = req.body;
    const idsSeguros = tagsIds.map(id => typeof id === 'object' ? Number(id.id) : Number(id));

    const usuarios = await Persona.findAll({
      attributes: ['id', 'nombre', 'email', 'activo', 'rol'],
      include: [{
        model: Tarea, as: 'tareas', required: true,
        include: [{ model: Tag, as: 'etiquetas', where: { id: { [Op.in]: idsSeguros } }, required: true }]
      }]
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en búsqueda avanzada' });
  }
};

export const buscarEtiquetasPorUsuarios = async (req, res) => {
  try {
    const { usuariosIds } = req.body;
    const idsSeguros = usuariosIds.map(id => typeof id === 'object' ? Number(id.id) : Number(id));

    const etiquetas = await Tag.findAll({
      include: [{
        model: Tarea, as: 'tareas', required: true,
        where: { personaId: { [Op.in]: idsSeguros } }, attributes: [] 
      }]
    });
    res.json({ success: true, data: etiquetas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en búsqueda avanzada' });
  }
};