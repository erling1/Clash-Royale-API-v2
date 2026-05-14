use actix_web::web;




pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(hello)
       .service(list_users)
       .service(create_user);
}


#[get("/hello")]
pub async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello, world!")
}

#[get("/users")]
pub async fn list_users() -> impl Responder {
    HttpResponse::Ok().body("List of users")
}

#[post("/users")]
pub async fn create_user() -> impl Responder {
    HttpResponse::Ok().body("User created")
}
