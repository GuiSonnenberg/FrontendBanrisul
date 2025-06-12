
import React, { useState, useEffect } from 'react';
import {
  listarOfertas,
  criarOferta,
  atualizarOferta,
  excluirOferta,
  buscarOfertasRecomendadas,
  OfertaCredito,
} from '../services/banrisulApi';
import { useToast } from '../hooks/use-toast';
import Loading from '../components/Loading';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { CreditCard, Plus, Edit, Trash2, Star, TrendingUp } from 'lucide-react';

const OfertasCredito: React.FC = () => {
  const [ofertas, setOfertas] = useState<OfertaCredito[]>([]);
  const [ofertasRecomendadas, setOfertasRecomendadas] = useState<OfertaCredito[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [ofertaEditando, setOfertaEditando] = useState<OfertaCredito | null>(null);
  const [scoreConsulta, setScoreConsulta] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    taxaJuros: '',
    numeroParcelas: '',
    valor: '',
    scoreMinimo: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    carregarOfertas();
  }, []);

  const carregarOfertas = async () => {
    setLoading(true);
    try {
      const dados = await listarOfertas();
      setOfertas(dados);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar ofertas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarRecomendacoes = async () => {
    if (!scoreConsulta) {
      toast({
        title: "Erro",
        description: "Digite um score para buscar recomendações",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dados = await buscarOfertasRecomendadas(parseInt(scoreConsulta));
      setOfertasRecomendadas(dados);
      toast({
        title: "Sucesso",
        description: `${dados.length} ofertas recomendadas encontradas`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao buscar recomendações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.descricao || !formData.taxaJuros || 
        !formData.numeroParcelas || !formData.valor || !formData.scoreMinimo) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const dados = {
        nome: formData.nome,
        descricao: formData.descricao,
        taxaJuros: parseFloat(formData.taxaJuros),
        numeroParcelas: parseInt(formData.numeroParcelas),
        valor: parseFloat(formData.valor),
        scoreMinimo: parseInt(formData.scoreMinimo),
      };

      if (ofertaEditando) {
        await atualizarOferta(ofertaEditando.id, dados);
        toast({
          title: "Sucesso!",
          description: "Oferta atualizada com sucesso",
        });
      } else {
        await criarOferta(dados);
        toast({
          title: "Sucesso!",
          description: "Oferta criada com sucesso",
        });
      }
      
      resetForm();
      setModalAberto(false);
      carregarOfertas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar oferta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      taxaJuros: '',
      numeroParcelas: '',
      valor: '',
      scoreMinimo: '',
    });
    setOfertaEditando(null);
  };

  const editarOferta = (oferta: OfertaCredito) => {
    setOfertaEditando(oferta);
    setFormData({
      nome: oferta.nome,
      descricao: oferta.descricao,
      taxaJuros: oferta.taxaJuros.toString(),
      numeroParcelas: oferta.numeroParcelas.toString(),
      valor: oferta.valor.toString(),
      scoreMinimo: oferta.scoreMinimo.toString(),
    });
    setModalAberto(true);
  };

  const excluirOfertaHandler = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta oferta?')) return;
    
    setLoading(true);
    try {
      await excluirOferta(id);
      toast({
        title: "Sucesso!",
        description: "Oferta excluída com sucesso",
      });
      carregarOfertas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir oferta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ofertas de Crédito</h1>
            <p className="text-gray-600">Gerencie ofertas e recomendações</p>
          </div>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setModalAberto(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {ofertaEditando ? 'Editar Oferta' : 'Nova Oferta de Crédito'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Oferta</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Crédito Pessoal Premium"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="50000.00"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva os benefícios e condições da oferta"
                  disabled={loading}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxaJuros">Taxa de Juros (%)</Label>
                  <Input
                    id="taxaJuros"
                    type="number"
                    step="0.01"
                    value={formData.taxaJuros}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxaJuros: e.target.value }))}
                    placeholder="2.5"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroParcelas">Nº Parcelas</Label>
                  <Input
                    id="numeroParcelas"
                    type="number"
                    value={formData.numeroParcelas}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroParcelas: e.target.value }))}
                    placeholder="24"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scoreMinimo">Score Mínimo</Label>
                  <Input
                    id="scoreMinimo"
                    type="number"
                    value={formData.scoreMinimo}
                    onChange={(e) => setFormData(prev => ({ ...prev, scoreMinimo: e.target.value }))}
                    placeholder="600"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <Loading size="sm" /> : ofertaEditando ? 'Atualizar' : 'Criar Oferta'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setModalAberto(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca de recomendações */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-6 w-6" />
            <span>Buscar Recomendações por Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="number"
                value={scoreConsulta}
                onChange={(e) => setScoreConsulta(e.target.value)}
                placeholder="Digite o score (300-850)"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                min="300"
                max="850"
              />
            </div>
            <Button 
              onClick={buscarRecomendacoes}
              disabled={loading}
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ofertas recomendadas */}
      {ofertasRecomendadas.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <span>Ofertas Recomendadas (Score: {scoreConsulta})</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {ofertasRecomendadas.length} ofertas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ofertasRecomendadas.map((oferta) => (
                <div key={oferta.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{oferta.nome}</h3>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{oferta.descricao}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-medium">{formatarValor(oferta.valor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa:</span>
                      <span className="font-medium">{oferta.taxaJuros}% a.m.</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parcelas:</span>
                      <span className="font-medium">{oferta.numeroParcelas}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de ofertas */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Todas as Ofertas</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {ofertas.length} ofertas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="Carregando ofertas..." />
            </div>
          ) : ofertas.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma oferta cadastrada
              </h3>
              <p className="text-gray-600">Crie sua primeira oferta de crédito</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ofertas.map((oferta) => (
                <Card key={oferta.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{oferta.nome}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editarOferta(oferta)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => excluirOfertaHandler(oferta.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{oferta.descricao}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Valor:</span>
                        <span className="font-medium text-green-600">
                          {formatarValor(oferta.valor)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa:</span>
                        <span className="font-medium">{oferta.taxaJuros}% a.m.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parcelas:</span>
                        <span className="font-medium">{oferta.numeroParcelas}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score mín.:</span>
                        <Badge variant="outline" className="text-xs">
                          {oferta.scoreMinimo}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfertasCredito;
