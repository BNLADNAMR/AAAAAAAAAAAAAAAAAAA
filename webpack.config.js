
const path = require('path');

module.exports = {
  entry: './index.tsx',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: false // لا نريد مسح المجلد إذا كان يحتوي على ملفات أخرى هامة
  },
  performance: {
    hints: false // لإخفاء تحذيرات حجم الملف الكبير في الإنتاج
  }
};
