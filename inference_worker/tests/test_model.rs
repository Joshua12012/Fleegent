use ort::session::Session;
use ort::value::TensorRef;
use ort::environment::Environment;
use std::sync::{Arc, OnceLock};
use std::path::Path;

static ORT_ENV: OnceLock<Arc<Environment>> = OnceLock::new();

fn get_ort_env() -> Arc<Environment> {
    ORT_ENV.get_or_init(|| {
        let dylib = if Path::new("../lib/x86_64/libonnxruntime.so").exists() {
            "../lib/x86_64/libonnxruntime.so"
        } else {
            "lib/x86_64/libonnxruntime.so"
        };
        let env_builder = ort::init_from(dylib).unwrap_or_else(|_| ort::init());
        Arc::new(env_builder.build().unwrap())
    }).clone()
}

#[test]
fn test_hot_swap_twice() {
    let env = get_ort_env();
    let model1_path = if Path::new("../data/models/yolov8n-coco.onnx").exists() {
        "../data/models/yolov8n-coco.onnx"
    } else {
        "data/models/yolov8n-coco.onnx"
    };
    let model2_path = if Path::new("../data/models/yolov8s-coco.onnx").exists() {
        "../data/models/yolov8s-coco.onnx"
    } else {
        "data/models/yolov8s-coco.onnx"
    };

    println!("Loading model 1: {}", model1_path);
    let mut session1 = Session::builder(&env)
        .unwrap()
        .with_intra_threads(2)
        .unwrap()
        .commit_from_file(model1_path)
        .unwrap();

    let dummy = vec![0.0f32; 3 * 640 * 640];
    let test_tensor1 = TensorRef::from_array_view(([1usize, 3, 640, 640], &dummy[..])).unwrap();
    let out1 = session1.run(ort::inputs![test_tensor1]).unwrap();
    let (s1, _) = out1[0].try_extract_tensor::<f32>().unwrap();
    println!("Model 1 out shape: {:?}", s1);

    // Second load in same process!
    println!("Loading model 2 (hot-swap): {}", model2_path);
    let env2 = get_ort_env();
    let mut session2 = Session::builder(&env2)
        .unwrap()
        .with_intra_threads(2)
        .unwrap()
        .commit_from_file(model2_path)
        .unwrap();

    let test_tensor2 = TensorRef::from_array_view(([1usize, 3, 640, 640], &dummy[..])).unwrap();
    let out2 = session2.run(ort::inputs![test_tensor2]).unwrap();
    let (s2, _) = out2[0].try_extract_tensor::<f32>().unwrap();
    println!("Model 2 out shape: {:?}", s2);

    println!("HOT-SWAP TWICE SUCCEEDED CLEANLY WITH ZERO ROLLBACK!");
}
