LOAD quack;

CALL quack_serve(
    'quack:0.0.0.0:4213',
    token = getenv('QUACK_TOKEN'),
    allow_other_hostname = true
);
