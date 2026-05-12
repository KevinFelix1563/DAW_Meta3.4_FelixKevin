import db from '../../models/index.cjs';
const { Tag } = db;

export const obtenerTodos = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crear = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    
    const nuevoTag = await Tag.create({ nombre });
    res.status(201).json({ success: true, data: nuevoTag });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByPk(id);
    
    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });
    
    await tag.update(req.body);
    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminados = await Tag.destroy({ where: { id } });
    
    if (eliminados === 0) return res.status(404).json({ success: false, message: 'Tag no encontrado' });
    
    res.json({ success: true, message: 'Tag eliminado permanentemente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};