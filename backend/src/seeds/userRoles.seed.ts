import { AppDataSource } from '@config/database.config';
import { UserRole } from '@entities';
import logger from '@setup/logger';

export const seedUserRoles = async () => {
  try {
    const userRoleRepository = AppDataSource.getRepository(UserRole);

    // Check if roles already exist
    const existingRoles = await userRoleRepository.count();
    if (existingRoles > 0) {
      logger.info('User roles already seeded, skipping...');
      return;
    }

    const roles = [
      {
        roleName: 'Admin',
        isActive: true
      },
      {
        roleName: 'User',
        isActive: true
      }
    ];

    for (const roleData of roles) {
      const role = userRoleRepository.create(roleData);
      await userRoleRepository.save(role);
      logger.info(`Created role: ${roleData.roleName}`);
    }

    logger.info('User roles seeded successfully');
  } catch (error) {
    logger.error('Error seeding user roles:', error);
    throw error;
  }
};
