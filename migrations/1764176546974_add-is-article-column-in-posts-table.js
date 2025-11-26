export const shorthands = undefined;

export const up = (pgm) => {
    pgm.addColumn('posts', {
        is_article: { type: 'boolean', notNull: true, comment: 'Проверяем новость это или статья пользователя' }
    }, { ifNotExists: true });
};

export const down = (pgm) => {};
