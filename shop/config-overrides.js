// config-overrides.js

module.exports = function override(config, env) {
  // Tìm đến mảng rules trong cấu hình module của Webpack
  // và thêm vào một rule mới để xử lý các file font.
  // Rule này sẽ bảo Webpack coi các file font là 'asset/resource',
  // giúp sao chép chúng vào thư mục build một cách chính xác.
  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  });

  // Rất quan trọng: Luôn trả về đối tượng config sau khi đã chỉnh sửa
  return config;
};