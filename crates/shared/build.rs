use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let proto_root = std::env::var("CARGO_MANIFEST_DIR")
        .map(|m| std::path::PathBuf::from(m).join("../../proto"))
        .unwrap_or_else(|_| Path::new("../../proto").into());

    let local_protoc = dirs_or_home().join(".local/bin/protoc");
    if local_protoc.exists() {
        std::env::set_var("PROTOC", local_protoc.to_str().unwrap());
    }

    tonic_build::configure().compile_protos(
        &[proto_root.join("edge.v1.proto")],
        &[&proto_root],
    )?;
    Ok(())
}

fn dirs_or_home() -> std::path::PathBuf {
    std::env::var("HOME")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|_| std::path::PathBuf::from("."))
}
