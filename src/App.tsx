import React, { useState, useMemo } from 'react';
import {
  Search, Plus, FileText, CheckCircle2, Clock,
  DollarSign, FileCheck, Tag, Building2, Calendar,
  Paperclip, Sun, Moon, ArrowRight, ChevronRight, X, Filter, AlertCircle,
  Phone, Printer
} from 'lucide-react';

// Dados Iniciais de Exemplo
const initialProcessos = [
  {
    id: '1',
    empenho: '2026NE0001',
    processo: '23079.234435/2025-12',
    beneficiario: 'EMBALAGENS LTDA',
    cnpj: '23.829.669/0001-96',
    telefone: '(11) 98765-4321',
    objeto: 'PAPEL HIGIENICO (Material de Limpeza)',
    classificacao: 'CUSTEIO',
    fonte: 'Participativo',
    modalidade: 'ATA',
    numeroModalidade: '12/2025',
    valorBruto: 88631.48,
    saefRetencao: 531.01,
    valorLiquido: 88100.47,
    status: 'Concluído',
    historico: [
      { data: '15/01/2026', titulo: 'EMPENHADO', descricao: 'Processo empenhado com sucesso.' },
      { data: '28/01/2026', titulo: 'AGUARDANDO NP', descricao: 'Aguardando emissão da Nota de Empenho.' }
    ]
  }
];

export default function App() {
  const [processos, setProcessos] = useState(initialProcessos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassificacao, setFilterClassificacao] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selectedProcesso, setSelectedProcesso] = useState<any>(initialProcessos[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Estado do Formulário de Novo Processo (Campos de Empenho e Valores agora são opcionais)
  const [formData, setFormData] = useState({
    processo: '',
    beneficiario: '',
    cnpj: '',
    telefone: '',
    objeto: '',
    classificacao: 'CUSTEIO',
    fonte: 'Participativo',
    modalidade: 'ATA',
    numeroModalidade: '',
    empenho: '',
    valorBruto: '',
    saefRetencao: '',
    status: 'Em Andamento'
  });

  // Filtros de busca e categoria
  const filteredProcessos = useMemo(() => {
    return processos.filter(p => {
      const matchesSearch =
        p.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.empenho && p.empenho.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesClassificacao = filterClassificacao === 'TODOS' || p.classificacao === filterClassificacao;
      const matchesStatus = filterStatus === 'TODOS' || p.status === filterStatus;

      return matchesSearch && matchesClassificacao && matchesStatus;
    });
  }, [processos, searchTerm, filterClassificacao, filterStatus]);

  // Estatísticas do Topo
  const stats = useMemo(() => {
    const totalBruto = processos.reduce((acc, p) => acc + (Number(p.valorBruto) || 0), 0);
    const totalRetencao = processos.reduce((acc, p) => acc + (Number(p.saefRetencao) || 0), 0);
    const totalLiquido = processos.reduce((acc, p) => acc + (Number(p.valorLiquido) || 0), 0);
    const concluidos = processos.filter(p => p.status === 'Concluído').length;
    const emAndamento = processos.filter(p => p.status === 'Em Andamento').length;

    return { totalBruto, totalRetencao, totalLiquido, concluidos, emAndamento };
  }, [processos]);

  // Adicionar Novo Processo (Sem exigir empenho e valores)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.processo || !formData.beneficiario) {
      alert('Por favor, preencha pelo menos o Número do Processo e o Beneficiário.');
      return;
    }

    const vBruto = formData.valorBruto ? parseFloat(formData.valorBruto) : 0;
    const vRetencao = formData.saefRetencao ? parseFloat(formData.saefRetencao) : 0;
    const vLiquido = vBruto - vRetencao;

    const newProc = {
      id: Date.now().toString(),
      ...formData,
      valorBruto: vBruto,
      saefRetencao: vRetencao,
      valorLiquido: vLiquido,
      historico: [
        {
          data: new Date().toLocaleDateString('pt-BR'),
          titulo: 'PROCESSO CRIADO',
          descricao: 'Processo cadastrado no sistema.'
        }
      ]
    };

    setProcessos([newProc, ...processos]);
    setSelectedProcesso(newProc);
    setIsModalOpen(false);
    setFormData({
      processo: '', beneficiario: '', cnpj: '', telefone: '', objeto: '',
      classificacao: 'CUSTEIO', fonte: 'Participativo', modalidade: 'ATA',
      numeroModalidade: '', empenho: '', valorBruto: '', saefRetencao: '', status: 'Em Andamento'
    });
  };

  // Função para Imprimir Resumo
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Estilos Exclusivos para Impressão */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-container { width: 100% !important; margin: 0 !important; padding: 0 !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* ÁREA APENAS PARA IMPRESSÃO */}
      <div className="print-only p-8">
        <h1 className="text-2xl font-bold mb-2">Relatório Resumido de Processos</h1>
        <p className="text-sm text-gray-600 mb-6">Gerado em: {new Date().toLocaleDateString('pt-BR')} - Total: {filteredProcessos.length} processo(s)</p>
        
        <table className="w-full border-collapse border border-gray-300 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Processo</th>
              <th className="border border-gray-300 p-2">Empenho</th>
              <th className="border border-gray-300 p-2">Beneficiário</th>
              <th className="border border-gray-300 p-2">Objeto</th>
              <th className="border border-gray-300 p-2">Valor Bruto (R$)</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcessos.map(p => (
              <tr key={p.id}>
                <td className="border border-gray-300 p-2">{p.processo}</td>
                <td className="border border-gray-300 p-2">{p.empenho || 'Pendente'}</td>
                <td className="border border-gray-300 p-2">{p.beneficiario}</td>
                <td className="border border-gray-300 p-2">{p.objeto || '-'}</td>
                <td className="border border-gray-300 p-2">{p.valorBruto ? p.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                <td className="border border-gray-300 p-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INTERFACE PRINCIPAL DO SISTEMA */}
      <div className="no-print">
        {/* Cabeçalho */}
        <header className={`border-b ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'} sticky top-0 z-10 backdrop-blur-md`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">SISTEMA DE ACOMPANHAMENTO DE PROCESSOS</h1>
                <p className="text-xs text-slate-400">Gestão de Registro e Trâmite de Licitações</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
                title="Imprimir Relatório Resumido"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Imprimir Resumo</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Processo</span>
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {/* Dashboard de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Valor Bruto</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-blue-400">R$ {stats.totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">SAEF / Retenção</span>
                <DollarSign className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-lg font-bold text-rose-400">R$ {stats.totalRetencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Valor Líquido</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-lg font-bold text-emerald-400">R$ {stats.totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Concluídos</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-emerald-500">{stats.concluidos}</p>
            </div>

            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Em Andamento</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-amber-500">{stats.emAndamento}</p>
            </div>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por empenho, processo, beneficiário ou objeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterClassificacao}
                onChange={(e) => setFilterClassificacao(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="TODOS">Todas Classificações</option>
                <option value="CUSTEIO">CUSTEIO</option>
                <option value="CAPITAL">CAPITAL</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="TODOS">Todos os Status</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          {/* Painel Principal com Lista e Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Lista Lateral de Processos */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Processos Cadastrados ({filteredProcessos.length})
              </h2>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredProcessos.map((p) => {
                  const isSelected = selectedProcesso?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProcesso(p)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : darkMode
                          ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                          {p.empenho || 'Empenho Pendente'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          p.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm mb-1">{p.processo}</h3>
                      <p className="text-xs text-slate-400 mb-2 truncate">{p.beneficiario}</p>

                      <div className="flex items-center justify-between text-xs border-t border-slate-800/50 pt-2 mt-2">
                        <span className="text-slate-400">{p.classificacao}</span>
                        <span className="font-semibold text-emerald-400">
                          R$ {(p.valorBruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painel de Detalhes do Processo Selecionado */}
            <div className="lg:col-span-7">
              {selectedProcesso ? (
                <div className={`p-6 rounded-xl border space-y-6 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  
                  {/* Detalhes do Topo */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold">
                          {selectedProcesso.empenho || 'EMPENHO PENDENTE'}
                        </span>
                        <span className="text-xs text-slate-400">{selectedProcesso.classificacao}</span>
                      </div>
                      <h2 className="text-xl font-bold">{selectedProcesso.processo}</h2>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Valor Bruto</p>
                      <p className="text-xl font-bold text-emerald-400">
                        R$ {(selectedProcesso.valorBruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Informações Gerais */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Beneficiário</p>
                      <p className="font-medium">{selectedProcesso.beneficiario}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">CNPJ</p>
                      <p className="font-medium">{selectedProcesso.cnpj || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Telefone</p>
                      <p className="font-medium">{selectedProcesso.telefone || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Modalidade</p>
                      <p className="font-medium">{selectedProcesso.modalidade} - {selectedProcesso.numeroModalidade || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Objeto */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Objeto do Processo</p>
                    <p className="text-sm bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                      {selectedProcesso.objeto || 'Nenhum detalhe adicional informado.'}
                    </p>
                  </div>

                  {/* Histórico / Trâmite */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Histórico de Movimentações
                    </h3>
                    <div className="space-y-3">
                      {selectedProcesso.historico?.map((h: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          <div>
                            <p className="font-semibold text-xs text-blue-400">{h.data} - {h.titulo}</p>
                            <p className="text-xs text-slate-400">{h.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 border border-dashed rounded-xl border-slate-800">
                  Selecione um processo ao lado para visualizar os detalhes.
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* MODAL: NOVO PROCESSO (Campos Opcionais Ajustados) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-xl border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold">Cadastrar Novo Processo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nº do Processo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 23079.234435/2025-12"
                    value={formData.processo}
                    onChange={(e) => setFormData({ ...formData, processo: e.target.value })}
                    className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Beneficiário *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da empresa ou fornecedor"
                    value={formData.beneficiario}
                    onChange={(e) => setFormData({ ...formData, beneficiario: e.target.value })}
                    className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              {/* Seção Opcional: Empenho e Valores */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400 font-semibold mb-2">Informações de Empenho e Valores (Opcionais nesta etapa)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nº do Empenho</label>
                    <input
                      type="text"
                      placeholder="Ex: 2026NE0001"
                      value={formData.empenho}
                      onChange={(e) => setFormData({ ...formData, empenho: e.target.value })}
                      className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Valor Bruto (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.valorBruto}
                      onChange={(e) => setFormData({ ...formData, valorBruto: e.target.value })}
                      className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Retenção SAEF (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.saefRetencao}
                      onChange={(e) => setFormData({ ...formData, saefRetencao: e.target.value })}
                      className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Objeto do Processo</label>
                <textarea
                  rows={2}
                  placeholder="Descrição resumida do objeto..."
                  value={formData.objeto}
                  onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                  className={`w-full p-2 rounded border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Salvar Processo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
