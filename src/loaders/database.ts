import DatabaseService from '@services/DatabaseService';

const setupDatabase = async () => {
    await DatabaseService.setup();
};

export default setupDatabase;
