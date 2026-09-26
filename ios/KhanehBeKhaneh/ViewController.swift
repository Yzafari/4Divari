import UIKit
import WebKit
import CoreLocation

final class ViewController: UIViewController, WKNavigationDelegate, CLLocationManagerDelegate {
    private var webView: WKWebView!
    private let locationManager = CLLocationManager()
    override func loadView() {
        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        view = webView
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else { return }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }
    private func jsonString(_ value: String) -> String { (try? String(data: JSONSerialization.data(withJSONObject: [value]), encoding: .utf8))?.dropFirst().dropLast().first.map(String.init) ?? "\"\"" }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let base = Bundle.main.object(forInfoDictionaryKey: "KHB_API_BASE") as? String ?? ""
        webView.evaluateJavaScript("window.KHB_API_BASE = \(jsonString(base));", completionHandler: nil)
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy)->Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.scheme == "http" || url.scheme == "https" { UIApplication.shared.open(url); decisionHandler(.cancel); return }
        decisionHandler(.allow)
    }
}
