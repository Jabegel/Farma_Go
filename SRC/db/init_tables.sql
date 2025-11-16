
CREATE TABLE IF NOT EXISTS favoritos (
  id_fav INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_produto INT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_fav_usuario_produto (id_usuario, id_produto)
);

CREATE TABLE IF NOT EXISTS enderecos (
  id_end INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  endereco TEXT NOT NULL,
  cidade VARCHAR(100),
  estado VARCHAR(50),
  cep VARCHAR(20),
  complemento VARCHAR(255),
  lat DOUBLE NULL,
  lng DOUBLE NULL,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id_pag INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  detalhe TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
