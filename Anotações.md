Node.js + TypeScript no back-end e React + TypeScript no front-end, pois essa é a stack
mais próxima do nosso dia a dia.


### Importante — Método de Correção:
## Serão considerados principalmente:
● clareza na análise dos problemas;
● simplicidade e coerência da solução proposta;
● tratamento de erros e estados de carregamento;
● validações mínimas no fluxo de checkout;
● comunicação de trade-offs;



### Contexto 
Você foi contratado(a) como Desenvolvedor(a) na CaseCellShop, uma empresa varejista focada na
venda de capinhas para celular. A empresa está passando por um período de hipercrescimento: o que
antes eram milhares de acessos diários na loja virtual, hoje se transformaram em milhões.


## Os 3 problemas identificados
Com o aumento drástico de acessos, três ofensores principais foram identificados:
### 01 | Performance da vitrine
A vitrine demora muitos segundos para carregar produtos, frustrando clientes logo no início da jornada.

## 02 | Consistência de estoque
Vários clientes conseguem comprar o mesmo produto quando o estoque acaba. A empresa está
vendendo itens que não possui.


## 03 | Resiliência do checkout
Ao finalizar a compra, a API do ERP demora para processar o pedido e gerar faturamento. A requisição
sofre timeout e o cliente perde a compra.



# Respostas

Pergunta 1 — Leitura inicial dos problemas
Para cada um dos 3 problemas identificados:
● O que você acredita estar causando o problema?

Problema 1:
Grande parte das requisições de um e-commerce são de apenas leitura, por exemplo, visualização de catalogo.
Um banco de dados relacional possui um pool de conexões que dependendo da seu hardware pode ser alto ou baixo.
Caso seja baixo o ideal é delegar a tarefa de leitura para bancos não relacionais ou chave-valor, por exemplo o redis.
Sempre que uma escrita(alteração/compra) for realizada no catalogo é necessário avisar o redis para ele alterar o seu cache.
O grande problema começa quando seu catalogo é grande, o redis armazena tudo na memória ram e grande volume de dados em memória não é uma boa ideia.
Ai a solução seria dividir o banco de dados em replicas (Escrita e leitura) de acordo com a demanda de requisições.
O mysql usa o binlog(arquivo de logs, assim como um histórico de commits), onde a replica de escrita guarda todas alterações e a replica de leitura faz um polling passivo para saber se houve alguma alteração.

Outra solução a nível de código é escalar horizontalmente o node.js, com o modulo cluster(fork de processo por cpu) ou com kubernetes.
Node.js é monothread, ou seja, ele roda na thread principal do núcleo, operações de E/S (escrita e leitura) são delegadas para o libuv que possui seus worker threads a nivel de Sistema operacional o que garante que o event Loop não trave!
Mas operações que necessitam computação, como geração de relatório, calculos, processamento de imagens etc... podem travar o event loop principal, e se não tiver escalonado horizontalmente é fazer com que clientes tenham que esperar muito para sua requisição ser processada.

Problema 2: 
Vou descrever a hierarquia de soluções.
Baixa demanda: Apenas um lock ja garante que não vá ter concorrência.
BEGIN
SELECT ...
UPDATE produtos set qtd_estoque = qtd_estoque - qtd_comprado where id = 123 and qtd_estoque >= qtd_comprado

COMMIT
O banco faz um lock na linha onde id=123, se uma operação tentar alterar a mesma linha ela terá que avisar.

Média demanda: Lock + Fila + escalonamento 
 Continuar com operação acima.
 Incluir uma fila com concorrência baixa. 1 por exemplo.
 Se tempo de espera para requisição ser efetuada for muito alto, implementar tecnologias para notificação como websockets ou até sse.

Alta demanda: Lock + Fila por categoria + escalonamento + replicas em banco por categoria
    Aqui você ja vai ter muita escrita. Você precisa ter hardware e uma boa arquitetura do seu sistema.
    Separar o banco de escrita em categoria, balancear a escrita.


Problema 3:
    Requisições http podem demorar bastante em sistemas com alta demanda, a solução ideal é implementar um timer de processamento na tela do cliente.
    Notificar ele por websocket ou SSE (server send Event) para não manter conexões http em aberto.
    Compra pode ser processada em segundo plano, conexão http não precisa estar em aberto!
    Uma solução é ter uma fila também, que reprocesse automaticamente as falhas, retry on error.

● Qual seria o impacto desse problema para o negócio ou para o cliente?
Problema 1:
Perda de cliente, ninguém gosta de ficar esperando uma tela carregar infinitamente, hoje em dia o tempo é precioso.

Problema 2:
Vender sem ter estoque, perder cliente!

Problema 3:
Perda de cliente também, ele teria que fazer a operação novamente de compra.
Perda de venda.


● Qual seria sua primeira hipótese de caminho para investigar ou melhorar?

Problema 1:
Ver a arquitetura do sistema.
Se não estiver ocupando 100% dos recursos do sistema que está hospedado ja esta errado.
Se estiver ocupando 100% full-time, a solução é investir em recursos(hardware).
Escalonamento horizontal e se precisar vertical.
Investigaria quem responde as requisições mais utilizas e que consomem apenas leitura.
Cache para requisições mais realizas e de apenas leitura.
Mostraria apenas as informações essencial, [nome, preço, descricao].


Problema 2: 
Investigaria como ocorre o processo de compra no final do estoque, o sistema teria outro comportamento.
Fila para processamento 1:1, assim gerando um tempo de resposta maior, mas evitando perdas.

Problema 3:
Verificaria o tempo de espera de uma requisição para processar pedidos. Definiria uma prioridade maior para essa rotina na fila.
Se essa solução ainda não resolver, passaria o processamento para segundo plano(sem manter a conexão http aberta) e delegaria para tecnologias de notiifcação


Pergunta 2 — Infraestrutura e serviços de apoio
De forma geral, o que você faria em relação à infraestrutura atual para suportar muitos acessos futuros
sem depender diretamente do ERP em cada requisição?

● Na resposta, cite pelo menos 3 conceitos ou serviços que poderiam ajudar.
● Não precisa conhecer uma cloud específica; o importante é explicar o papel de cada item.

Citado na pergunta 1: Redis, Replicas no banco(escrita e leitura). Cache no cliente com tempo de vida
Escalonamento horizontal: Kubernetes ou cluster do node.js


Pergunta 3 — SDD: Spec-Driven Development
Imagine que você precisa implementar o endpoint POST /checkout que finaliza a compra. Antes de
codificar:
● Que informações esse endpoint precisa receber?


{
    cart_id: 1,
    client_id: 1,
    payment_id: 1, // Com dados do pagamento etc...
    idempotency_key: "uuid" // Evitar que a mesmo checkout seja processado duas vezes
}
Essas são as informações essenciais

● O que ele deve devolver em caso de sucesso?
Indicar o sucesso. E retornar um identificador do pedido.
● O que ele deve devolver em caso de erro?
Indicar o erro, por que do erro. Caso indisponibilidade do serviço retry.

● Por que é importante definir esse contrato antes de escrever código?
Para não fazer go-horse e definir os requisitos.


Pergunta 4 — TDD: Test-Driven Development
Sobre testes do mesmo endpoint POST /checkout:
● Que testes você escreveria para garantir que ele funciona corretamente? Liste pelo menos 3
cenários.

Sistema pagamentos(gateway) offline
Diferentes tipos de pagamento.
Compras sem estoque.

Há vantagem em escrever os testes antes de implementar a rota? Por quê?
Não vejo vantagens



Pergunta 5 — Uso de IA no desenvolvimento
Se você fosse implementar a solução para o Problema 2 (Furo de Estoque) usando IA:
● Que perguntas ou instruções você daria à IA?
Explicaria o meu problema, a trataria como um par técnico mas ela não tomaria as decisões por mim.
Perguntaria se meus casos de uso estão completos, caso contrario, solicitaria indicações.
Se ela entendeu complementamente o caso de uso, caso contraria, pediria para ela realizar perguntas para compreender completamente.



