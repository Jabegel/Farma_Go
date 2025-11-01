DROP DATABASE IF EXISTS farmago;
CREATE DATABASE farmago;
USE farmago;

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

-- Cria nova tabela para cadastro detalhado
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

-- Dados de exemplo (para testar no painel admin)
INSERT INTO farmacias (nome, imagem, endereco, cep, cnpj, telefone, email) VALUES
('Farmácia São José', 'imagens/farmacia1.png', 'Rua das Flores, 123', '13456-789', '12.345.678/0001-90', '(19) 98877-1122', 'contato@farmaciasj.com'),
('Farmácia Popular', 'imagens/farmacia2.png', 'Av. Brasil, 45', '13025-670', '98.765.432/0001-10', '(19) 97755-4411', 'vendas@farmaciapopular.com'),
('Drogaria Central', 'imagens/farmacia3.png', 'Rua Central, 89', '13015-880', '55.666.777/0001-55', '(19) 91234-5678', 'contato@drogariacentral.com');

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

-- FARMACÊUTICOS
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

-- RECEITAS ACEITAS
CREATE TABLE IF NOT EXISTS receitas (
    id_receita INT AUTO_INCREMENT PRIMARY KEY,
    nome_medicamento VARCHAR(100) NOT NULL,
    quantidade INT,
    farmaceutico_id INT,
    data_aceite DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmaceutico_id) REFERENCES farmaceuticos(id_farmaceutico)
);

INSERT INTO receitas (nome_medicamento, quantidade, farmaceutico_id)
VALUES ('Amoxicilina 500mg', 2, 1);

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


-- Dados de exemplo
INSERT INTO compras (id_usuario, id_farmacia, item, quantidade) VALUES
(1, 1, 'Dipirona 500mg', 2),
(1, 2, 'Paracetamol 750mg', 1),
(2, 1, 'Vitamina C 1g', 3);
