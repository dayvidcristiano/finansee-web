import apiClient from "./apiClient";

const mapFormaPagamento = (tipo) => {
 if (!tipo) return 'OUTROS'; // Garante que não quebre se for nulo

 const map = {
  cartao: 'CARTAO_CREDITO',
  pix: 'PIX',
  boleto: 'BOLETO',
  debito: 'CARTAO_DEBITO' // Adicionei 'debito' caso exista
 };
 return map[tipo.toLowerCase()] || 'OUTROS';
};


export const getTransactions = async (filters = {}) => {
 try {
  // O apiClient transforma { dataInicio: '...' } em "?dataInicio=..."
  const { data } = await apiClient.get('/transacoes', { params: filters });
 
  // O backend (TransacaoService) já fez todo o trabalho.
  // Os dados já vêm prontos: unificados, ordenados, e com valores negativos.
  return data;
 
 } catch (error) {
  console.error("Erro ao buscar transações:", error.response?.data || error.message);
  // Retorna um array vazio em caso de erro para não quebrar a tela
  return [];
 }
};


export const createTransaction = async (formData) => {

 const {tipo, ...payload } = formData;

 // 3. Decide qual endpoint chamar
 let endpoint = '';
 if (tipo === 'despesa') {
  endpoint = '/despesas';
 } else if (tipo === 'receita') {
  endpoint = '/receitas';
 } else {
  // Falha rápida se o tipo for inválido
  throw new Error("Tipo de transação inválido: " + tipo);
 }

 try {
  // 4. Faz a chamada POST para o endpoint correto
  const { data } = await apiClient.post(endpoint, payload);

  // 5. Retorna os dados para o frontend (React)
  // O backend retorna o DTO (ex: DespesaDTO), mas o frontend
  // precisa saber o 'tipo' para atualizar o estado corretamente.
  // Então, adicionamos o 'tipo' de volta.
  return {
   ...data, // Os dados retornados pelo backend (id, descricao, valor, etc.)
   tipo: tipo, // Adiciona o 'tipo' para o frontend saber
  
   // O mock antigo retornava o valor negativo. Nosso backend real NÃO FAZ ISSO.
   // A lógica de negativar o valor será feita pelo `GET /api/transacoes` (que já fizemos).
   // Mas para a atualização imediata da tela, podemos fazer isso aqui também:
   valor: tipo === 'despesa' ? -Math.abs(data.valor) : data.valor
  };
 
 } catch (error) {
  console.error("Erro ao criar transação:", error.response?.data || error.message);
  throw new Error(error.response?.data?.message || "Não foi possível criar a transação.");
 }
};

export const updateTransaction = async (formData) => {
 const { id, tipo, ...payload } = formData;

 if (!id || !tipo) {
  throw new Error("ID da transação ou tipo não fornecido para atualização.");
 }

 // 2. Decide o endpoint
 const endpoint = tipo === 'despesa' ? `/despesas/${id}` : `/receitas/${id}`;

 try {
  // 3. Faz a chamada PUT
  const { data } = await apiClient.put(endpoint, payload);

  // 4. Retorna os dados atualizados
  return {
   ...data,
   tipo: tipo,
   valor: tipo === 'despesa' ? -Math.abs(data.valor) : data.valor
  };
 
 } catch (error) {
  console.error(`Erro ao atualizar ${tipo}:`, error.response?.data || error.message);
  throw new Error(error.response?.data?.message || `Não foi possível atualizar a ${tipo}.`);
 }
};

export const deleteTransaction = async (transaction) => {
 const { id, tipo } = transaction;

 if (!id || !tipo) {
  throw new Error("Não é possível deletar: ID ou tipo da transação está faltando.");
 }

 const endpoint = tipo.toUpperCase() === 'DESPESA' ? `/despesas/${id}` : `/receitas/${id}`;

 try {
  await apiClient.delete(endpoint);
 
  return { success: true };

 } catch (error) {
  console.error(`Erro ao deletar ${tipo}:`, error.response?.data || error.message);
  throw new Error(error.response?.data?.message || `Não foi possível deletar a ${tipo}.`);
 }
};

// Categorias

export const getCategories = async () => {
 try {
  const { data } = await apiClient.get('/categorias');
  return data; // Retorna a lista de CategoriaDTO
 } catch (error) {
  console.error("Erro ao buscar categorias:", error.response?.data || error.message);
  return []; // Retorna array vazio para não quebrar a UI
 }
};

export const createCategory = async (categoryData) => {
  // categoryData (do formulário) é: { name, type, color, orcamento }
 try {
  // O DTO do backend (CategoriaDTO) espera: nome, tipo, cor
  const payload = {
   nome: categoryData.name, // O mock usava 'name', vamos traduzir
   tipo: categoryData.type.toUpperCase(), // O mock usava 'type', e o backend espera ENUM
   cor: categoryData.color, // O mock usava 'color'
      // <-- ADICIONADO
   orcamento: categoryData.type === 'despesa' ? (Number(categoryData.orcamento) || 0) : 0
  };
  const { data } = await apiClient.post('/categorias', payload);
  return data;
 } catch (error) {
  console.error("Erro ao criar categoria:", error.response?.data || error.message);
  throw new Error(error.response?.data?.message || "Não foi possível criar a categoria.");
 }
};

export const updateCategory = async (categoryData) => {
  // <-- ADICIONADO 'orcamento'
 const { id, name, type, color, orcamento } = categoryData;
 if (!id) throw new Error("ID da categoria não fornecido para atualização.");

 const payload = {
  nome: name,
  tipo: type.toUpperCase(),
  cor: color,
    // <-- ADICIONADO
  orcamento: type === 'despesa' ? (Number(orcamento) || 0) : 0
 };

 try {
  const { data } = await apiClient.put(`/categorias/${id}`, payload);
  return data;
 } catch (error) {
  console.error("Erro ao atualizar categoria:", error.response?.data || error.message);
  throw new Error(error.response?.data?.message || "Não foi possível atualizar a categoria.");
 }
};

export const deleteCategory = async (id) => {
 if (!id) throw new Error("ID da categoria não fornecido para deleção.");

 try {
  await apiClient.delete(`/categorias/${id}`);
  return { success: true };
 } catch (error) {
  console.error("Erro ao deletar categoria:", error.response?.data || error.message);
  // Erro comum: Tentar deletar categoria que está em uso
  if (error.response?.status === 500) {
   throw new Error("Não foi possível deletar. Verifique se esta categoria está sendo usada por alguma transação.");
  }
  throw new Error(error.response?.data?.message || "Não foi possível deletar a categoria.");
 }
};

export const loginUser = async (credentials) => {
 try {
  // A chamada não precisa de token, pois é para obter um
  const { data } = await apiClient.post('/auth/login', credentials);
 
  // O backend retorna um ResponseDTO com 'name' e 'token'
  return data;
 } catch (error) {
  console.error("Erro no login:", error.response?.data || error.message);
  throw new Error("Email ou senha inválidos. Tente novamente.");
 }
};

export const registerUser = async (userData) => {
 try {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
 } catch (error) {
  console.error("Erro no registro:", error.response?.data || error.message);
  throw new Error("Não foi possível registrar. O email pode já estar em uso.");
 }
};