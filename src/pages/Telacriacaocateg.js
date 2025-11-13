import React, { useState, useEffect } from 'react';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';

const COLOR_OPTIONS = [
  '#FF6347', '#4682B4', '#3CB371', '#9370DB',
  '#FFD700', '#B22222', '#008080', '#8B4513',
  '#FF4500', '#483D8B', '#228B22', '#D2B48C'
];

const Telacriacaocateg = ({
  onClose,
  onBackToCategories,
  onSaveSuccess,
  categoryToEdit = null
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    color: COLOR_OPTIONS[0],
    type: 'despesa',
    orcamento: '' // campo adicionado
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (categoryToEdit && categoryToEdit.id) {
      setIsEditing(true);
      setFormData({
        id: categoryToEdit.id,
        name: categoryToEdit.nome || '',
        type: categoryToEdit.tipo?.toLowerCase() || 'despesa',
        color: categoryToEdit.cor || COLOR_OPTIONS[0],
        orcamento: categoryToEdit.orcamento || ''
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        name: '',
        color: COLOR_OPTIONS[0],
        type: 'despesa',
        orcamento: ''
      });
    }
  }, [categoryToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    // prepara dados sem quebrar backend
    const dataToSave = {
      nome: formData.name,
      tipo: formData.type,
      cor: formData.color,
      orcamento: formData.type === 'despesa' ? formData.orcamento : null
    };

    if (isEditing) {
        dataToSave.id = formData.id;
    }

    onSaveSuccess(dataToSave);
  };

  const isLightColor = (hex) => {
    if (!hex || hex.length !== 7) return false;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
  };

  return (
    <div className="form-modal-overlay">
      <div className="form-card category-details-modal">
        <div className="modal-header">
          <FaArrowLeft className="icon-back" onClick={onBackToCategories} />
          <h2>{isEditing ? "Editar Categoria" : "Criar Categoria"}</h2>
          <FaTimes className="icon-close" onClick={onClose} />
        </div>

        <form onSubmit={handleSave}>
          <div
            className="category-preview"
            style={{
              backgroundColor: formData.color,
              color: isLightColor(formData.color) ? '#333' : 'white'
            }}
          >
            {formData.name || (isEditing ? 'Visualização' : 'Nome da Categoria')}
          </div>

          <label>Título</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Alimentação, Transporte"
            className="styled-input"
            required
          />

          <label>Tipo</label>
          <div className="type-toggle-group">
            <button
              type="button"
              className={`toggle-button ${formData.type === 'despesa' ? 'active despesa-active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'despesa' }))}
            >
              Despesa
            </button>
            <button
              type="button"
              className={`toggle-button ${formData.type === 'receita' ? 'active receita-active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'receita' }))}
            >
              Receita
            </button>
          </div>

          {formData.type === 'despesa' && (
            <>
              <label>Orçamento (Opcional)</label>
              <div className="input-group">
                <span className="currency-symbol">R$</span>
                <input
                  type="number"
                  name="orcamento"
                  value={formData.orcamento}
                  onChange={handleChange}
                  placeholder="500,00"
                  style={{
                    border: 'none',
                    padding: '12px 0',
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '1rem',
                    fontWeight: 'normal'
                  }}
                  min="0"
                  step="0.01"
                />
              </div>
            </>
          )}

          <label>Selecione uma cor</label>
          <div className="color-palette">
            {COLOR_OPTIONS.map((color) => (
              <div
                key={color}
                className={`color-option ${formData.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color: color }))}
              />
            ))}
          </div>

          <button type="submit" className="create-button category-save-button">
            {isEditing ? "Salvar Edição" : "Criar Categoria"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Telacriacaocateg;
