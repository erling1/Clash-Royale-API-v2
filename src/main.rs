use::actix_web::{get,HttpResponse, Responder}



mod routes:



#[actix_web::main]
async fn main() -> std::io::Result<()> {

    HttpServer::new(|| {
        App::new().configure(routes::config)
    })
    
}
