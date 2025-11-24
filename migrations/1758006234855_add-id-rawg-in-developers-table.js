export const shorthands = undefined;

export const up = (pgm) => {
    pgm.addColumn('developers', {
        id_from_rawg: { type: 'integer', notNull: false }
    }, { ifNotExists: true });
};

export const down = (pgm) => {};
