DROP DATABASE IF EXISTS farmago;
CREATE DATABASE farmago;
USE farmago;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'farmacia', 'entregador', 'farmaceutico', 'admin') NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, login, senha, tipo) VALUES
('João Cliente', 'joaocliente', '1234', 'cliente'),
('Farmácia São José', 'farmaciasj', '1234', 'farmacia'),
('Carlos Entregador', 'carlosent', '1234', 'entregador'),
('Dra. Ana Paula', 'anafarma', '1234', 'farmaceutico'),
('Max Admin', 'maxadmin', '1234', 'admin');

USE farmago;

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
