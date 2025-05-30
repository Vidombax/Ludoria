export const shorthands = undefined;

export const up = (pgm) => {
    pgm.sql('alter table posts add is_active boolean;');
};

export const down = (pgm) => {};
