export const shorthands = undefined;

export const up = (pgm) => {
    pgm.addColumn('posts', {
        photo: { type: 'text', notNull: false }
    }, { ifNotExists: true });
};

export const down = (pgm) => {};
