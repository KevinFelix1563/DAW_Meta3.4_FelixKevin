import db from '../../models/index.cjs';

const { Tarea, Persona, Tag } = db;

// 1. OBTENER TODAS LAS TAREAS
export const obtenerTodas = async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      include: [
        { model: Persona, as: 'autor', attributes: ['id', 'nombre', 'email'] },
        { model: Tag, as: 'etiquetas', attributes: ['id', 'nombre'], through: { attributes: [] } }
      ]
    });
    res.json({ success: true, data: tareas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener tareas', error: error.message });
  }
};

// 2. CREAR TAREA
export const crear = async (req, res) => {
  try {
    const { titulo, descripcion, completada, personaId } = req.body;
    
    if (!titulo || !personaId) {
      return res.status(400).json({ success: false, message: 'El título y el personaId son obligatorios' });
    }

    const nuevaTarea = await Tarea.create({ titulo, descripcion, completada, personaId });
    res.status(201).json({ success: true, data: nuevaTarea });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la tarea', error: error.message });
  }
};

// 3. ACTUALIZAR TAREA
export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findByPk(id);
    
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await tarea.update(req.body);
    res.json({ success: true, message: 'Tarea actualizada', data: tarea });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar', error: error.message });
  }
};

// 4. ELIMINAR TAREA
export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminados = await Tarea.destroy({ where: { id } });

    if (eliminados === 0) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    res.json({ success: true, message: 'Tarea eliminada permanentemente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar', error: error.message });
  }
};


// 5. ASOCIAR TAREA CON TAG
export const agregarTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    const tarea = await Tarea.findByPk(id);
    const tag = await Tag.findByPk(tagId);

    if (!tarea || !tag) return res.status(404).json({ success: false, message: 'Tarea o Tag no encontrado' });

    await tarea.addEtiqueta(tag); 
    res.json({ success: true, message: 'Tag asociado a la tarea con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al asociar', error: error.message });
  }
};

// 6. BUSCAR TAREAS POR TAG
export const tareasPorTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const tag = await Tag.findByPk(tagId, {
      include: [{ model: Tarea, as: 'tareas' }]
    });

    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });
    
    res.json({ success: true, data: tag.tareas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en la búsqueda', error: error.message });
  }
};