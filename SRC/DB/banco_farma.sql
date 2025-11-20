DROP DATABASE IF EXISTS farmago;
CREATE DATABASE farmago;
USE farmago;

-- ========================================
-- TABELA DE USUÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'farmacia', 'entregador', 'farmaceutico', 'admin') NOT NULL,
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, login, senha, tipo) VALUES
('João Cliente', 'joaocliente', '1234', 'cliente'),
('Farmácia São José', 'farmaciasj', '1234', 'farmacia'),
('Carlos Entregador', 'carlosent', '1234', 'entregador'),
('Dra. Ana Paula', 'anafarma', '1234', 'farmaceutico'),
('Max Admin', 'maxadmin', '1234', 'admin');


-- ========================================
-- TABELA CADASTROS COMPLETOS
-- ========================================
CREATE TABLE IF NOT EXISTS cadastros (
    id_cadastro INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    nome_exibicao VARCHAR(100) NOT NULL,
    login_nome VARCHAR(50) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    tipo_conta ENUM('cliente', 'entregador', 'farmacia') NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- ========================================
-- TABELA DE ENDEREÇOS DO USUÁRIO
-- ========================================
CREATE TABLE IF NOT EXISTS enderecos (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    cep VARCHAR(10) NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(5) NOT NULL,
    complemento VARCHAR(150),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ========================================
-- TABELA DE FARMÁCIAS
-- ========================================
CREATE TABLE IF NOT EXISTS farmacias (
    id_farmacia INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    imagem VARCHAR(255) DEFAULT NULL,
    endereco VARCHAR(255),
    cep VARCHAR(10),
    cnpj VARCHAR(18),
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO farmacias (nome, imagem, endereco, cep, cnpj, telefone, email) VALUES
('Farmácia São José', 'imagens/farmacia1.png', 'Rua das Flores, 123', '13456-789', '12.345.678/0001-90', '(19) 98877-1122', 'contato@farmaciasj.com'),
('Farmácia Popular', 'imagens/farmacia2.png', 'Av. Brasil, 45', '13025-670', '98.765.432/0001-10', '(19) 97755-4411', 'vendas@farmaciapopular.com'),
('Drogaria Central', 'imagens/farmacia3.png', 'Rua Central, 89', '13015-880', '55.666.777/0001-55', '(19) 91234-5678', 'contato@drogariacentral.com');

-- ========================================
-- TABELA ENTREGADORES
-- ========================================
CREATE TABLE IF NOT EXISTS entregadores (
    id_entregador INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    veiculo VARCHAR(50),
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO entregadores (nome, login, cpf, telefone, veiculo, email) VALUES
('Carlos Entregador', 'carlosent', '123.456.789-00', '(19) 98877-1234', 'Moto', 'carlos@farma.com'),
('Lucas Express', 'lucasexp', '987.654.321-00', '(19) 97766-4321', 'Carro', 'lucas@farma.com');

-- ========================================
-- TABELA FARMACÊUTICOS
-- ========================================
CREATE TABLE IF NOT EXISTS farmaceuticos (
    id_farmaceutico INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    crm VARCHAR(20),
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO farmaceuticos (nome, login, crm, email) VALUES
('Dra. Ana Paula', 'anafarma', 'CRM-12345', 'ana@farmago.com');

-- ========================================
-- TABELAS DE COMPRAS E PRODUTOS
-- ========================================
CREATE TABLE IF NOT EXISTS compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_farmacia INT NOT NULL,
    item VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_farmacia) REFERENCES farmacias(id_farmacia)
);

INSERT INTO compras (id_usuario, id_farmacia, item, quantidade) VALUES
(1, 1, 'Dipirona 500mg', 2),
(1, 2, 'Paracetamol 750mg', 1),
(2, 1, 'Vitamina C 1g', 3);

CREATE TABLE IF NOT EXISTS produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    id_farmacia INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INT DEFAULT 0,
    categoria VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_farmacia) REFERENCES farmacias(id_farmacia)
);

INSERT INTO produtos (id_farmacia, nome, descricao, preco, imagem, estoque, categoria) VALUES
(1, 'Dipirona 500mg', 'Analgésico e antitérmico', 9.90, 'imagens/dipirona.png', 100, 'Medicamentos'),
(2, 'Vitamina C 1g', 'Suplemento vitamínico', 12.50, 'imagens/vitaminaC.png', 80, 'Vitaminas'),
(2, 'Paracetamol 750mg', 'Analgésico e antitérmico', 8.50, 'imagens/paracetamol.png', 120, 'Medicamentos'),
(3, 'Álcool em Gel 70%', 'Antisséptico para mãos', 6.90, 'imagens/alcoolgel.png', 50, 'Higiene');

-- ========================================
-- TABELAS DO CARRINHO
-- ========================================
CREATE TABLE IF NOT EXISTS carrinho (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('aberto', 'finalizado', 'cancelado') DEFAULT 'aberto',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS carrinho_itens (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_carrinho INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_carrinho) REFERENCES carrinho(id_carrinho) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

INSERT INTO carrinho (id_usuario, status) VALUES
(1, 'aberto'),
(1, 'finalizado');

INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 2, 9.90),
(1, 2, 1, 12.50),
(2, 3, 1, 8.50);



-- Campos extras no usuário
ALTER TABLE usuarios
  ADD COLUMN apelido VARCHAR(100) NULL AFTER nome,
  ADD COLUMN data_nascimento DATE NULL AFTER email,
  ADD COLUMN alergias TEXT NULL,
  ADD COLUMN obs_medicas TEXT NULL,
  ADD COLUMN foto_perfil VARCHAR(255) NULL;

-- Tabela de cartões do usuário
CREATE TABLE IF NOT EXISTS cartoes (
    id_cartao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome_impresso VARCHAR(100) NOT NULL,
    numero_mascarado VARCHAR(25) NOT NULL,
    bandeira VARCHAR(30),
    validade_mes TINYINT,
    validade_ano SMALLINT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);



CREATE TABLE pedidos (
    id_pedido BIGINT PRIMARY KEY,
    id_usuario INT NOT NULL,
    pagamento VARCHAR(20),
    id_cartao INT,
    total DECIMAL(10,2),
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE pedidos_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2),

    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);


