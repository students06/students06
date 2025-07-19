const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
    const results = await executeQuery(query, [username]);
    return results[0] || null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
    const results = await executeQuery(query, [id]);
    return results[0] || null;
  }

  static async getAll() {
    const query = 'SELECT id, username, name, role, permissions, created_at FROM users WHERE is_active = TRUE ORDER BY created_at DESC';
    return await executeQuery(query);
  }

  static async create(userData) {
    const { username, password, name, role, permissions } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, password, name, role, permissions) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      username, 
      hashedPassword, 
      name, 
      role, 
      JSON.stringify(permissions || {})
    ]);
    
    return result.insertId;
  }

  static async update(id, userData) {
    const { username, password, name, role, permissions } = userData;
    let query = 'UPDATE users SET username = ?, name = ?, role = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    let params = [username, name, role, JSON.stringify(permissions || {}), id];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET username = ?, password = ?, name = ?, role = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [username, hashedPassword, name, role, JSON.stringify(permissions || {}), id];
    }
    
    const result = await executeQuery(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePermissions(id, permissions) {
    const query = 'UPDATE users SET permissions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [JSON.stringify(permissions), id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;