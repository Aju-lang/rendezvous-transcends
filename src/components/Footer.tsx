const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-6 w-6 bg-gradient-to-br from-red-500 to-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              RENDEZVOUS
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Silver Edition - Mi'araj Life Festival 2025</p>
            <p>Markaz Mihraj Malayil</p>
            <p className="text-xs opacity-75">
              Powered by RENDEZVOUS Team • Built with Lovable + Supabase
            </p>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2025 RENDEZVOUS. Transcending Illusions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;