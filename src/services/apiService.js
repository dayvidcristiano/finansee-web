import apiClient from "./apiClient";

const mapFormaPagamento = (tipo) => {
 if (!tipo) return 'OUTROS';

 const map = {
  cartao: 'CARTAO_CREDITO',
  pix: 'PIX',
  boleto: 'BOLETO',
  debito: 'CARTAO_DEBITO'
 };
 return map[tipo.toLowerCase()] || 'OUTROS';
};


export const getTransactions = async (filters = {}) => {
 try {
  const { data } = await apiClient.get('/transacoes', { params: filters });
  return data;
 
 } catch (error) {
  console.error("Erro ao buscar transações:", error.response?.data || error.message);
  // Retorna um array vazio em caso de erro para não quebrar a tela
  return [];
 }
};


export const createTransaction = async (formData) => {

 const {tipo, ...payload } = formData;

 let endpoint = '';
 if (tipo === 'despesa') {
  endpoint = '/despesas';
 } else if (tipo === 'receita') {
  endpoint = '/receitas';
 } else {
  throw new Error("Tipo de transação inválido: " + tipo);
 }

 try {
  const { data } = await apiClient.post(endpoint, payload);

  return {
   ...data, 
   tipo: tipo,
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

// ===========================================
// --- FUNÇÕES DE CATEGORIA ---
// ===========================================

export const getCategories = async () => {
 try {
  const { data } = await apiClient.get('/categorias');
  return data; 
 } catch (error) {
  console.error("Erro ao buscar categorias:", error.response?.data || error.message);
  return []; 
 }
};

export const createCategory = async (categoryData) => {
 try {
  const payload = {
   nome: categoryData.name, 
   tipo: categoryData.type.toUpperCase(),
   cor: categoryData.color, 
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

// ===========================================
// --- FUNÇÕES DE AUTENTICAÇÃO ---
// ===========================================

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

// ===========================================
// --- FUNÇÕES DE RELATÓRIO (HU06 e HU07) ---
// ===========================================


// comentado pois 'getResumoDoMes' será utilizado no seu lugar.
// export const getGastosPorCategoria = async (ano, mes) => {
//   try {
//       const { data } = await apiClient.get('/relatorios/gastos-por-categoria', {
//         params: { ano, mes }
//       });
//       return data; 
//     } catch (error) {
//       console.error("Erro ao buscar dados do relatório:", error.response?.data || error.message);
//       throw new Error("Não foi possível carregar os dados do gráfico.");
//     }
// };

export const getResumoDoMes = async (ano, mes) => {
  try {
    const { data } = await apiClient.get('/relatorios/resumo-mes', {
      params: { ano, mes }
    });
    return data; // Retorna o objeto { totalReceitas, totalDespesas, saldoDoMes, gastosPorCategoria }
  } catch (error) {
    console.error("Erro ao buscar resumo do mês:", error.response?.data || error.message);
    throw new Error("Não foi possível carregar os dados do relatório.");
  }
};

export const exportarRelatorioPDF = async (ano, mes) => {
  try {
    const { data } = await apiClient.get('/relatorios/exportar-pdf', {
      params: { ano, mes },
      responseType: 'blob' 
    });
    return data; 
  } catch (error) {
    console.error("Erro ao exportar PDF:", error.response?.data || error.message);
    throw new Error("Não foi possível gerar o relatório em PDF.");
  }
};

// ===========================================
// --- FUNÇÕES DE DASHBOARD ---
// ===========================================
export const getDashboardData = async () => {
  try {
    const { data } = await apiClient.get('/dashboard');
    return data; 
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error.response?.data || error.message);
    throw new Error("Não foi possível carregar os dados do dashboard.");
  }
};