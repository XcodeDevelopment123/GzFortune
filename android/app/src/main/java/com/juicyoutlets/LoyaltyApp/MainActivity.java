package com.luckypot.luckypotapp;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); // 先调用 super

        Window window = getWindow();

        // 1. 开启沉浸式：内容延伸到状态栏 / 导航栏下面
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // 2. 把状态栏、导航栏改成透明（或者你想要的颜色）
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // 3. 关键：根据系统栏高度，给根视图加 paddingBottom
        // 这样 WebView 的「可用区域」永远在导航栏之上
        View contentView = findViewById(android.R.id.content);

        ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            // 只管 bottom，把 WebView 往上抬这么多像素
            v.setPadding(0, 0, 0, bars.bottom);
            return insets; // 不消费，WebView 里面还可以继续用 insets（如果需要）
        });

        // 主动请求一次，让上面的 listener 立即生效
        ViewCompat.requestApplyInsets(contentView);
    }
}
