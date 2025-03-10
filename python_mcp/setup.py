from setuptools import setup, find_packages

setup(
    name="kitchenai-mcp",
    version="0.1.0",
    description="KitchenAI Prompts MCP (Master Control Program) Server",
    author="KitchenAI",
    author_email="info@kitchenai.com",
    url="https://github.com/epuerta9/prompts.kitchenai",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask>=2.0.0",
        "requests>=2.25.0",
    ],
    entry_points={
        "console_scripts": [
            "kitchenai-mcp=mcp_server:main",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
    ],
    python_requires=">=3.7",
) 